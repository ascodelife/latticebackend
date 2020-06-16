import LatticeModel from "../models/lattice/LatticeModel";
import { isIntersect, diff, intersect, set2Str } from "../utils/set-operation";

export default class LatticeReader {
  constructor(id) {
    //初始化格模型
    this._lattice = new LatticeModel(id);
  }
  /**
   * @description: 读取
   * @param {type}
   * @return:
   */
  async read() {
    //初始化格式化数据
    let data = {};
    //保存已访问概念
    let visit = new Set();
    //从inf节点出发向上遍历
    let inf = await this._lattice.getInfNode();
    //保存所有属性集合
    let attrSet = inf.intents;
    //保存待遍历概念节点（队列）
    let conceptQueue = [inf];
    //遍历
    while (conceptQueue.length) {
      //一个概念出队
      let concept = conceptQueue.pop();
      //如果当前概念是已经访问过或内涵为空，跳出本次循环
      if (visit.has(concept.id) || concept.intents.size === 0) {
        continue;
      }
      //取当前概念的父概念
      let parentArr = (await this._lattice.getParent(concept)) || [];
      //取当前概念的子概念
      let childArr = (await this._lattice.getChild(concept)) || [];
      //如果当前概念的外延不为空
      if (concept.extents.size) {
        //初始化父概念数组
        let parents = [];
        for (let parent of parentArr) {
          //父概念内涵为空，直接退出循环
          if (parent.intents.size === 0) {
            break;
          }
          //若父概念是属性概念，需要重新命名
          if (this.isAttrConcept(parent, attrSet)) {
            parents.push(await this.getAttrConceptName(parent));
          } else {
            parents.push(parent.toString());
          }
        }
        //初始化子概念数组
        let children = [];
        for (let child of childArr) {
          //子概念内涵为空，直接退出循环
          if (child.extents.size === 0) {
            break;
          }
          //若子概念是属性概念，需要重新命名
          if (this.isAttrConcept(child, attrSet)) {
            children.push(await this.getAttrConceptName(child));
          } else {
            children.push(child.toString());
          }
        }
        let conceptStr = concept.toString();
        //如果当前概念是属性概念需要更名
        if (this.isAttrConcept(concept, attrSet)) {
          conceptStr = await this.getAttrConceptName(concept);
        }
        //初始化文件数组
        let files = [...concept.extents].filter((obj) => !attrSet.has(obj));
        //构建数据
        data[conceptStr] = {
          name: conceptStr,
          files,
          parents,
          children,
        };
        //如果不是属性概念就置标志位
        if (!this.isAttrConcept(concept, attrSet)) {
          data[concept.toString()].lattice = true;
        }
        //加入已访问数组
        visit.add(concept.id);
      }

      //所有父概念入队
      conceptQueue = [...parentArr, ...conceptQueue];
    }
    return data;
  }

  /**
   * @description: 判断是否是属性概念
   * @param {type} concept 待判断概念
   * @param {type} attrSet 所有属性集合
   * @return:
   */

  isAttrConcept(concept, attrSet) {
    // console.log(concept.extents, attrSet);
    return isIntersect(concept.extents, attrSet);
  }

  /**
   * @description: 取属性概念的命名
   * @param {type} concept 属性概念
   * @return:
   */

  async getAttrConceptName(concept) {
    let parent = await this._lattice.getParent(concept);
    if (parent && parent.length) {
      let diffIntents = diff(concept.intents, parent[0].intents);
      return set2Str(diffIntents);
    }
    return set2Str(concept.intents);
  }
}
