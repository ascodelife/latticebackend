/*
 * @Author: your name
 * @Date: 2020-02-06 22:11:16
 * @LastEditTime: 2020-06-08 23:55:43
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \express-app2\src\algo\LatticeConstructer.js
 */

import LatticeModel from "../models/lattice/LatticeModel";
import LatticeNodeModel from "../models/lattice/LatticeNodeModel";
import { union, intersect, isSub, isEql } from "../utils/set-operation";

export default class LatticeConstructer {
  constructor(id) {
    //初始化格模型
    this._lattice = new LatticeModel(id);
  }

  /**
   * @description: 概念格中添加一个概念格节点
   * @param {string} newNode 要添加的节点模型
   * @return:
   */
  async addConcept(newNode) {
    // let newNode = new LatticeNodeModel(props);
    //概念格为空时
    if ((await this._lattice.getNodeCount()) == 0) {
      //该节点既是sup节点又是inf节点
      this._lattice.setInfNode(newNode, true);
      this._lattice.setSupNode(newNode, true);
      //在数据库中添加节点
      await this._lattice.addNode(newNode);
      return;
    }
    //概念格不为空时
    //从数据库中获取inf节点
    let infNode = await this._lattice.getInfNode();
    //console.log('47:infNode----->', infNode);
    if (!isSub(newNode.intents, infNode.intents)) {
      if (infNode.extents.size == 0) {
        infNode.intents = union(infNode.intents, newNode.intents);
        //在数据库中更新该节点
        await this._lattice.updateNode(infNode);
      } else {
        //新建一个节点作为inf节点
        let newInfNode = new LatticeNodeModel();
        newInfNode.intents = union(infNode.intents, newNode.intents);
        //替换原有的inf节点
        this._lattice.setInfNode(newInfNode, true);
        this._lattice.setInfNode(infNode, false);
        //更新数据库
        await this._lattice.addNode(newInfNode);
        await this._lattice.updateNode(infNode);
        //添加父子关系
        await this._lattice.addChild(infNode, newInfNode);
        //console.log('65:newInfNode----->', newInfNode);
      }
    }
    //存储已访问节点数组:[Set<int>]
    let visitedCs = new Array();
    //遍历数据库按内涵势排序生成id
    let nodeIdArr = await this._lattice.getNodeIdOrderByIntentsLen();
    //console.log('72:nodeIdArr----->', nodeIdArr);
    for (let id of nodeIdArr.values()) {
      let node = new LatticeNodeModel();
      node.id = id;
      //根据节点id获取节点属性
      await this._lattice.getNodePorpsById(node);
      //console.log('76:node----->', node);
      if (isSub(node.intents, newNode.intents)) {
        //如果是更新概念
        //更新外延取并集
        node.extents = union(node.extents, newNode.extents);
        //在数据库中更新
        await this._lattice.updateNode(node);
        //记录访问节点
        this._lattice.updateArray(node, visitedCs);
      } else {
        //如果不是更新概念
        let newIntents = intersect(node.intents, newNode.intents);
        //若在已访问概念集合中，不存在概念内涵与newIntents相等，则产生新概念节点
        let isGen = true;
        if (visitedCs.length > newIntents.size) {
          for (let visitedCId of visitedCs[newIntents.size].values()) {
            let visitedC = new LatticeNodeModel();
            visitedC.id = visitedCId;
            await this._lattice.getNodePorpsById(visitedC);
            if (isEql(visitedC.intents, newIntents)) {
              isGen = false;
            }
          }
        }
        if (isGen) {
          //若生成了新概念
          let genNode = new LatticeNodeModel();
          genNode.intents = newIntents;
          genNode.extents = union(node.extents, newNode.extents);
          //添加节点
          await this._lattice.addNode(genNode);
          //添加关系
          await this._lattice.addChild(genNode, node);
          //生成概念加入已访问点集合
          this._lattice.updateArray(genNode, visitedCs);
          //找父概念来更新边
          //遍历已访问点集合
          for (let i = 0; i < genNode.intents.size; i++) {
            if (!visitedCs[i]) {
              continue;
            }
            for (let visitedCId of visitedCs[i].values()) {
              let visitedC = new LatticeNodeModel();
              visitedC.id = visitedCId;
              await this._lattice.getNodePorpsById(visitedC);
              if (isSub(visitedC.intents, genNode.intents)) {
                //潜在的父节点
                let isParent = true;
                let childArr = await this._lattice.getChild(visitedC);
                for (let child of childArr.values()) {
                  if (isSub(child.intents, genNode.intents)) {
                    isParent = false;
                    break;
                  }
                }
                if (isParent) {
                  //是父子关系就直接移除父子关系，这里免去判断
                  await this._lattice.delChild(visitedC, node);
                  //与生成子加边'genNode:', genNode.id)
                  await this._lattice.addChild(visitedC, genNode);
                }
              }
            }
          }
        }
      }
    }
    //寻找入度为0的节点对sup节点进行更新
    await this._lattice.updateSupNode();
  }

  async removeAttribute(attribute) {
    //存放已访问节点ID
    const visit = [];
    //判断节点是否已判断
    const vs = new Set();
    //存放更新或删除节点
    const cs = new Set();
    //保存待处理或更新的节点
    let inf = await this._lattice.getInfNode();
    const allConcepts = [inf];
    //如果节点只剩下一个，且其內延移除后为空，则直接移除整个格
    if ((await this._lattice.getNodeCount()) === 1) {
      let concept = allConcepts[0];
      if (concept.intents.has(attribute) && concept.intents.size === 1) {
        await this._lattice.clear();
        return;
      }
    }
    //自底向上开始遍历
    while (allConcepts.length !== 0) {
      //选取最底层节点
      let concept = allConcepts.pop();
      //若属性在内涵里
      if (concept.intents.has(attribute)) {
        //移除掉这个属性
        concept.intents.delete(attribute);
        //在数据库中更新
        await this._lattice.updateNode(concept);
      }
      //初始化该节点的删除基节点
      let conceptDb = new LatticeNodeModel();
      //遍历该节点的父节点
      let parentArr = await this._lattice.getParent(concept);
      for (let parent of parentArr) {
        //若原删除基节点为空，且选取节点移除属性后与其父节点属性相同
        if (conceptDb.id === -1 && isEql(concept.intents, parent.intents)) {
          //那么这个父节点就是删除基节点，该待处理节点为删除节点，记录删除节点的删除基节点
          conceptDb = parent;
          //如果这个节点恰好是inf节点
          let inf = await this._lattice.getInfNode();
          if (inf.id === concept.id) {
            //则其父节点充当其成为新的inf节点
            this._lattice.setInfNode(parent, true);
            //更新到数据库
            await this._lattice.updateNode(parent);
          }
          //如果他的父节点不是删除基节点的话，那么这个父节点有可能是保留节点、更新节点或删除节点
        } else {
          //若该父节点未被访问，且满足当前遍历节点删除基节点不为空 或 删除属性在父节点属性集合中
          if (
            !vs.has(parent.id) &&
            (conceptDb.id !== -1 || parent.intents.has(attribute))
          ) {
            //再添加父节点到遍历列表all_concepts尾部
            allConcepts.push(parent);
            //父节点置cs标志位
            cs.add(parent.id);
          }
          //添加父节点到保持访问过的节点集合尾
          visit.push(parent.id);
          //父节点置vs标志位
          vs.add(parent.id);
        }
      }
      //如果存在删除基节点，那么就需要对删除节点的边进行调整
      if (conceptDb.id !== -1) {
        //遍历删除节点的子节点
        let childArr = await this._lattice.getChild(concept);
        for (let child of childArr) {
          //用于标志删除基节点和删除节点子节点间是否新增边
          let needEdge = true;
          //遍历删除节点的子节点的父节点Ccp
          let childParentArr = await this._lattice.getParent(child);
          for (let cp of childParentArr) {
            // 若Ccp没有cs标记，即不是更新或删除节点
            // 且 Ccp不是原节点C
            // 且 Ccp的外延包含于Cdb删除基外延(即两个节点间存在偏序关系)
            if (
              !cs.has(cp.id) &&
              cp.id !== concept.id &&
              isSub(cp.extents, conceptDb.extents)
            ) {
              //那么不需要新增边
              needEdge = false;
              break;
            }
          }
          if (needEdge) {
            //新增边
            await this._lattice.addChild(conceptDb, child);
          }
        }
        //删除节点及其关联的边
        await this._lattice.delNode(concept);
      }
      //若删除基节点不存在，即无删除节点
      else {
        //取消该节点的cs标记
        if (cs.has(concept)) {
          cs.delete(concept.id);
        }
      }
    }
    //如果格的节点数量为1,显然其为sup节点，若其内涵为空，则清空格
    if ((await this._lattice.getNodeCount()) === 1) {
      let sup = await this._lattice.getSupNode();
      if (sup.intents.size === 0) {
        await this._lattice.clear();
      }
    }
  }

  /**
   * @description: 概念格中删除一个对象
   * @param {string} object 要删除的对象名
   * @return:
   */
  async removeObject(object) {
    //存放已访问节点ID
    const visit = [];
    //判断节点是否已判断
    const vs = new Set();
    //存放更新或删除节点
    const cs = new Set();
    //保存待处理或更新的节点
    let sup = await this._lattice.getSupNode();
    const allConcepts = [sup];
    //如果节点只剩下一个，且其外延移除后为空，则直接移除整个格
    if ((await this._lattice.getNodeCount()) === 1) {
      let concept = allConcepts[0];
      if (concept.extents.has(object) && concept.extents.size === 1) {
        await this._lattice.clear();
        return;
      }
    }
    //自顶向下开始遍历
    while (allConcepts.length !== 0) {
      //选取最底层节点
      let concept = allConcepts.pop();
      //若对象在外延里
      if (concept.extents.has(object)) {
        //移除掉这个对象
        concept.extents.delete(object);
        //在数据库中更新
        await this._lattice.updateNode(concept);
      }
      //初始化该节点的删除基节点
      let conceptDb = new LatticeNodeModel();
      //遍历该节点的子节点
      let childArr = await this._lattice.getChild(concept);
      for (let child of childArr) {
        //若原删除基节点为空，且选取节点移除属性后与其父节点属性相同
        if (conceptDb.id === -1 && isEql(concept.extents, child.extents)) {
          //那么这个父节点就是删除基节点，该待处理节点为删除节点，记录删除节点的删除基节点
          conceptDb = child;
          //如果这个节点恰好是sup节点
          let sup = await this._lattice.getSupNode();
          if (sup.id === concept.id) {
            //则其子节点充当其成为新的sup节点
            this._lattice.setSupNode(child, true);
            //更新到数据库
            await this._lattice.updateNode(child);
          }
          //如果他的子节点不是删除基节点的话，那么这个子节点有可能是保留节点、更新节点或删除节点
        } else {
          //若该子节点未被访问，且满足当前遍历节点删除基节点不为空 或 删除对象在子概念外延中
          if (
            !vs.has(child.id) &&
            (conceptDb.id !== -1 || child.extents.has(object))
          ) {
            //再添加子节点到遍历列表all_concepts尾部
            allConcepts.push(child);
            //子节点置cs标志位
            cs.add(child.id);
          }
          //添加子节点到保持访问过的节点集合尾
          visit.push(child.id);
          //子节点置vs标志位
          vs.add(child.id);
        }
      }
      //如果存在删除基节点，那么就需要对删除节点的边进行调整
      if (conceptDb.id !== -1) {
        //遍历删除节点的父节点
        let parentArr = await this._lattice.getParent(concept);
        for (let parent of parentArr) {
          //用于标志删除基节点和删除节点父节点间是否新增边
          let needEdge = true;
          //遍历删除节点的父节点的子节点Cpc
          let parentChildArr = await this._lattice.getChild(parent);
          for (let pc of parentChildArr) {
            // 若Cpc没有cs标记，即不是更新或删除节点
            // 且 Cpc不是原节点C
            // 且 Cpc的内涵包含于Cdb删除基内涵(即两个节点间存在偏序关系)
            if (
              !cs.has(pc.id) &&
              pc.id !== concept.id &&
              isSub(pc.intents, conceptDb.intents)
            ) {
              //那么不需要新增边
              needEdge = false;
              break;
            }
          }
          if (needEdge) {
            //新增边
            await this._lattice.addChild(parent, conceptDb);
          }
        }
        //删除节点及其关联的边
        await this._lattice.delNode(concept);
      }
      //若删除基节点不存在，即无删除节点
      else {
        //取消该节点的cs标记
        if (cs.has(concept)) {
          cs.delete(concept.id);
        }
      }
    }
    //如果格的节点数量为1,显然其为inf节点，若其外延为空，则清空格
    if ((await this._lattice.getNodeCount()) === 1) {
      let inf = await this._lattice.getInfNode();
      if (inf.extents.size === 0) {
        await this._lattice.clear();
      }
    }
  }

  //getter和setter

  get lattice() {
    return this._lattice;
  }
}
