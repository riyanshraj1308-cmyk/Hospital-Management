const express = require('express');
const router = express.Router();
const { getInvoices, getInvoice, createInvoice, updateInvoice, recordPayment, getBillingStats } = require('../controllers/billing.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.use(authenticate);
router.get('/stats', getBillingStats);
router.get('/', getInvoices);
router.post('/invoice', createInvoice);
router.get('/:id', getInvoice);
router.put('/:id', updateInvoice);
router.put('/:id/pay', recordPayment);

module.exports = router;
