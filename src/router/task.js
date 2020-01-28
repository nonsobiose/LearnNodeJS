const express = require("express");
const router = express.Router();
const Task = require("../models/task");
const auth = require("../middleware/auth");

router.post("/tasks", auth, async (req, res) => {
    const task = new Task({
        ...req.body,
        owner: req.user._id
    });
    try {
        await task.save();
        res.status(201).send(task)
    } catch(err) {
        res.status(400).send(err);
    }
});

router.get("/tasks", auth, async (req, res) => {

    const sortByQuery = req.query.sortBy;
    const sortBy = {};
    if(sortByQuery) {
        const sortByParts= sortByQuery.split(":");
        sortBy[sortByParts[0]] = sortByParts[1];
    }

    let queryObject = {
        owner: req.user._id,
    };

    if(req.query.completed !== undefined) {
        queryObject.completed = req.query.completed;
    }

    try {
        const tasks = await Task
            .find(queryObject)
            .limit(parseInt(req.query.limit))
            .skip(parseInt(req.query.skip))
            .sort(sortBy);
        res.send(tasks);
    }catch (err) {
        res.status(404).send(err);
    }
});

router.get("/tasks/:id", auth, async (req, res) => {
    const _id = req.params.id;
    try {
        const task = await Task.findOne({_id, owner: req.user._id});
        if(!task) {
            res.status(404).send();
            return;
        }
        res.send(task);
    } catch(err) {
        res.status(500).send(err);
    }
});

router.patch("/tasks/:id", auth, async (req, res) => {
    const allowedUpdates = ["description", "completed"];
    const newUpdates = Object.keys(req.body);
    const containsValidUpdates = newUpdates.every(value => allowedUpdates.includes(value));
    if(!containsValidUpdates) {
        res.status(400).send("Invalid update operation!");
        return;
    }

    const _id = req.params.id;
    try {
        const task = await Task.findOne({_id, owner: req.user._id});

        if(!task) {
            res.status(404).send();
            return;
        }
        newUpdates.forEach(value => task[value] = req.body[value]);
        await task.save();

        res.send(task);
    } catch(err) {
        res.status(400).send(err);
    }
});

router.delete("/tasks/:id", auth, async (req, res) => {
    try {
        const task = await Task.findByIdAndDelete({_id: req.params.id, owner: req.user._id});
        if(!task) {
            res.status(404).send();
            return;
        }
        res.send(task);
    } catch (err) {
        res.status(400).send(err);
    }
});

module.exports = router;

