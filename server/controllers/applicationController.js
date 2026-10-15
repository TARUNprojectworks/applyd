const mongoose = require('mongoose');
const Application = require('../models/Application');
const { STATUSES } = require('../models/Application');

// Fields the user is allowed to set when adding/editing.
// "user" and "statusHistory" are NOT here, so a client can't overwrite them.
const EDITABLE_FIELDS = [
  'company',
  'role',
  'jobLink',
  'location',
  'salaryExpectation',
  'appliedDate',
  'interviewDate',
  'notes',
];

// Copies only the allowed fields from req.body
function pickFields(body) {
  const data = {};
  EDITABLE_FIELDS.forEach((field) => {
    if (body[field] !== undefined) data[field] = body[field];
  });
  if (data.interviewDate === '') data.interviewDate = null; // empty date input = no interview
  return data;
}

// Mongoose validation errors (missing required field, bad enum) -> 400 with the first message
function handleError(err, res, next) {
  if (err.name === 'ValidationError') {
    const firstError = Object.values(err.errors)[0];
    return res.status(400).json({ message: firstError.message });
  }
  if (err.name === 'CastError') {
    return res.status(400).json({ message: `Invalid value for ${err.path}` });
  }
  next(err);
}

// Escapes characters like . * ( so a search for "C++" doesn't break the regex
function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Finds an application only if it belongs to the logged-in user.
// Returns null for a bad id or someone else's application -> caller sends 404.
async function findOwnApplication(id, userId) {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  return Application.findOne({ _id: id, user: userId });
}

// GET /api/applications?search=&status=&sort=
async function getApplications(req, res, next) {
  try {
    const { search, status, sort } = req.query;

    // Always start the filter with the owner -> users only see their own data
    const filter = { user: req.user.id };

    if (search) {
      const regex = new RegExp(escapeRegex(search), 'i'); // 'i' = case-insensitive
      filter.$or = [{ company: regex }, { role: regex }]; // match company OR role
    }

    if (status && STATUSES.includes(status)) {
      filter.status = status;
    }

    // sort=oldest -> ascending by appliedDate, anything else -> newest first
    const sortOrder = sort === 'oldest' ? 1 : -1;

    const applications = await Application.find(filter).sort({ appliedDate: sortOrder, createdAt: sortOrder });
    res.json(applications);
  } catch (err) {
    handleError(err, res, next);
  }
}

// GET /api/applications/:id
async function getApplication(req, res, next) {
  try {
    const application = await findOwnApplication(req.params.id, req.user.id);
    if (!application) return res.status(404).json({ message: 'Application not found' });
    res.json(application);
  } catch (err) {
    handleError(err, res, next);
  }
}

// GET /api/applications/stats
async function getStats(req, res, next) {
  try {
    // Aggregation pipeline: documents flow through the stages in order.
    // 1) $match keeps only this user's applications
    // 2) $group groups them by status and counts each group
    // Note: in aggregate() Mongoose does NOT auto-convert strings to ObjectId, so we do it ourselves.
    const groups = await Application.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(req.user.id) } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    // groups looks like: [ { _id: 'Applied', count: 4 }, { _id: 'Offer', count: 1 } ]

    // Start every status at 0 so missing groups still show up
    const stats = { total: 0, Applied: 0, Interview: 0, Offer: 0, Rejected: 0 };
    groups.forEach((g) => {
      stats[g._id] = g.count;
      stats.total += g.count;
    });

    // Response rate = applications that got any reply / total
    const responded = stats.Interview + stats.Offer + stats.Rejected;
    stats.responseRate = stats.total === 0 ? 0 : Math.round((responded / stats.total) * 100);

    res.json(stats);
  } catch (err) {
    handleError(err, res, next);
  }
}

// POST /api/applications
async function createApplication(req, res, next) {
  try {
    const data = pickFields(req.body);
    const status = req.body.status || 'Applied';

    if (!STATUSES.includes(status)) {
      return res.status(400).json({ message: 'Status must be Applied, Interview, Offer or Rejected' });
    }

    const application = await Application.create({
      ...data,
      status,
      user: req.user.id, // owner comes from the token, never from the request body
      statusHistory: [{ status, changedAt: new Date() }], // first timeline entry
    });

    res.status(201).json(application);
  } catch (err) {
    handleError(err, res, next);
  }
}

// PUT /api/applications/:id  -> edit details (status is changed by the PATCH route)
async function updateApplication(req, res, next) {
  try {
    const application = await findOwnApplication(req.params.id, req.user.id);
    if (!application) return res.status(404).json({ message: 'Application not found' });

    application.set(pickFields(req.body)); // copy new values onto the document
    await application.save(); // save() runs the schema validation again

    res.json(application);
  } catch (err) {
    handleError(err, res, next);
  }
}

// PATCH /api/applications/:id/status  -> change status and record it in history
async function updateStatus(req, res, next) {
  try {
    const { status } = req.body;

    if (!STATUSES.includes(status)) {
      return res.status(400).json({ message: 'Status must be Applied, Interview, Offer or Rejected' });
    }

    const application = await findOwnApplication(req.params.id, req.user.id);
    if (!application) return res.status(404).json({ message: 'Application not found' });

    // Only add a history entry if the status really changed
    if (application.status !== status) {
      application.status = status;
      application.statusHistory.push({ status, changedAt: new Date() });
      await application.save();
    }

    res.json(application);
  } catch (err) {
    handleError(err, res, next);
  }
}

// DELETE /api/applications/:id
async function deleteApplication(req, res, next) {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Filtering by both _id and user means you can't delete someone else's document
    const deleted = await Application.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!deleted) return res.status(404).json({ message: 'Application not found' });

    res.json({ message: 'Application deleted', id: deleted._id });
  } catch (err) {
    handleError(err, res, next);
  }
}

module.exports = {
  getApplications,
  getApplication,
  getStats,
  createApplication,
  updateApplication,
  updateStatus,
  deleteApplication,
};
