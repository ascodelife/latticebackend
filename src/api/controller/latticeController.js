import LatticeConstructer from "../algo/LatticeConstructer";
import LatticeNodeModel from "../models/lattice/LatticeNodeModel";
import LatticeReader from "../algo/LatticeReader";
import LatticeModel from "../models/lattice/LatticeModel";

const latticeId = "tagdemo"

export const addFiles = async (req, res) => {
  console.log("addFiles", req.body);
  const { files, tags } = req.body;
  //初始化一个格节点
  let node = new LatticeNodeModel();
  node.intents = new Set(tags);
  node.extents = new Set(files);
  //初始化格构造模型
  let lc = new LatticeConstructer(latticeId);
  //增量式添加节点
  await lc.addConcept(node);
  //返回格结构
  let lr = new LatticeReader(latticeId);
  let data = await lr.read();
  console.log("data", data);
  res.send(data);
};

export const removeFile = async (req, res) => {
  console.log("removeFile", req.body);
  const { file } = req.body;
  //初始化格构造模型
  let lc = new LatticeConstructer(latticeId);
  //增量式添加节点
  await lc.removeObject(file);
  //返回格结构
  let lr = new LatticeReader(latticeId);
  let data = await lr.read();
  console.log("data", data);
  res.send(data);
};

export const addTag = async (req, res) => {
  console.log("addTag", req.body);
  const { tag } = req.body;
  //初始化一个格节点
  let node = new LatticeNodeModel();
  //引入虚拟对象
  let intents = new Set([tag]);
  if (req.body.ancestors && req.body.ancestors.length > 0) {
    // console.log(req.body.ancestors);
    intents = new Set([...intents, ...req.body.ancestors]);
  }
  node.intents = intents;
  node.extents = new Set([tag]);
  console.log(node.intents, node.extents);
  //初始化格构造模型
  let lc = new LatticeConstructer(latticeId);
  //增量式添加节点
  await lc.addConcept(node);
  //返回格结构
  let lr = new LatticeReader(latticeId);
  let data = await lr.read();
  console.log("data", data);
  res.send(data);
};

export const removeTag = async (req, res) => {
  console.log("removeTag", req.body);
  const { tag } = req.body;
  let tagList = [tag];
  //移除包含标签及其后代标签
  if (req.body.descendants && req.body.descendants.length > 0) {
    //console.log(req.body.descendants);
    tagList.unshift(...req.body.descendants);
  }
  //初始化格构造模型
  let lc = new LatticeConstructer(latticeId);
  //先移除属性
  for (let tag of tagList) {
    await lc.removeAttribute(tag);
  }
  //再移除虚拟对象
  for (let tag of tagList) {
    await lc.removeObject(tag);
  }
  //返回格结构
  let lr = new LatticeReader(latticeId);
  let data = await lr.read();
  console.log("data", data);
  res.send(data);
};

export const clear = async (req, res) => {
  console.log("clear", req.body);
  //初始化格模型
  let lm = new LatticeModel(latticeId);
  //清空格
  lm.clear();
  res.send("OK");
};
