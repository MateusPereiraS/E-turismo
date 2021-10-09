const express = require('express')
const router = express.Router()
const mongoose = require("mongoose")
const { ObjectId } = require('bson')
const bcryptjs = require("bcryptjs")

router.get('/dashboard', function (req,res) {

    res.render('admin/dashboard/dashboard')
})


module.exports = router;