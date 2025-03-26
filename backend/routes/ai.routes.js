const express = require('express');
const aiController = require("../controllers/ai.controllers");
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();
router.use(authMiddleware)

router.post("/generate-campaign", aiController.getReview)

router.post("/generate-draft",aiController.getMail)
module.exports = router;    