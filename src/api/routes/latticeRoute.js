import express from "express";

const router = express.Router();
import {
  addFiles,
  removeFile,
  addTag,
  removeTag,
  clear,
} from "../controller/latticeController";

router.post("/addFiles", async (req, res) => {
  await addFiles(req, res);
});

router.post("/removeFile", async (req, res) => {
  await removeFile(req, res);
});

router.post("/addTag", async (req, res) => {
  await addTag(req, res);
});

router.post("/removeTag", async (req, res) => {
  await removeTag(req, res);
});

router.post("/clear", async (req, res) => {
  await clear(req, res);
});

export default router;
