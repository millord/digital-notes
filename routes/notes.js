const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const { ensureAuthenticate } = require("../helpers/auth");

// Loading the Note Model
require("../models/Note");
const Note = mongoose.model("notes");

// The Note index Page
router.get("/", ensureAuthenticate, async (req, res) => {
  await Note.find({ user: req.user.id })
    .sort({ date: "desc" })
    .then(notes => {
      res.render("notes/index", {
        notes: notes
      });
    });
});

// Add note Form
router.get("/add", ensureAuthenticate, async (req, res) => {
  await Note.find({ user: req.user.id })
    .sort({ date: "desc" })
    .then(notes => {
      res.render("notes/add", { notes: notes });
    });
});

// Edit Note Form
router.get("/edit/:id", ensureAuthenticate, async (req, res) => {
  await Note.findOne({
    _id: req.params.id
  }).then(note => {
    if (note.user != req.user.id) {
      req.flash("error_msg", "Not Authorized");
      res.redirect("/notes");
    } else {
      res.render("notes/edit", {
        note: note
      });
    }
  });
});

// Actually the process Form
router.post("/", ensureAuthenticate, (req, res) => {
  let errors = [];

  if (!req.body.title) {
    errors.push({ text: "Please add a title" });
  }
  if (!req.body.details) {
    errors.push({ text: "Please add some details" });
  }
  if (errors.length > 0) {
    res.render("/add", {
      errors: errors,
      title: req.body.title,
      details: req.body.details
    });
  } else {
    const newUser = {
      title: req.body.title,
      details: req.body.details,
      user: req.user.id
    };
    new Note(newUser).save().then(note => {
      req.flash("success_msg", "The Journal note was Added");
      res.redirect("/notes");
    });
  }
});

// This is the route for editing the form process
router.put("/:id", ensureAuthenticate, async (req, res) => {
  await Note.findOne({
    _id: req.params.id
  }).then(note => {
    // new value into the form
    note.title = req.body.title;
    note.details = req.body.details;
    note.save().then(note => {
      req.flash("success_msg", "The Journal note was updated");
      res.redirect("/notes");
    });
  });
});

// This is the route for deleting a Note
router.delete("/:id", ensureAuthenticate, async (req, res) => {
  await Note.deleteOne({
    _id: req.params.id
  }).then(() => {
    req.flash("success_msg", "The note was removed");
    res.redirect("/notes");
  });
});

module.exports = router;
