const express = require('express');
const auth = require('../middleware/auth');
const {
  getApplications,
  getApplication,
  getStats,
  createApplication,
  updateApplication,
  updateStatus,
  deleteApplication,
} = require('../controllers/applicationController');

const router = express.Router();

// Every route in this file needs a logged-in user
router.use(auth);

// /stats must come BEFORE /:id, otherwise Express would treat "stats" as an id
router.get('/stats', getStats);

router.get('/', getApplications);
router.post('/', createApplication);
router.get('/:id', getApplication);
router.put('/:id', updateApplication); // edit details
router.patch('/:id/status', updateStatus); // change only the status
router.delete('/:id', deleteApplication);

module.exports = router;
