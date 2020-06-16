/*
 * @Author: your name
 * @Date: 2020-02-07 17:11:20
 * @LastEditTime : 2020-02-14 22:23:14
 * @LastEditors  : Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \express-app2\src\api\models\lattice\LatticeModel.js
 */
import BaseGraphModel from '../base/BaseGraphModel'
import LatticeNodeModel from '../lattice/LatticeNodeModel'
import LatticeRelationship from './LatticeRelationship';
import {
    NODE_UPDATE_SUP_STATEMENT
} from '../../../neo4j/Cypher';
export default class LatticeModel extends BaseGraphModel {

    constructor(id) {
        super(new Set(['lattice_' + id]));
        this._id = id;
    }

    /**
     * @description: 按照内涵势排序取节点id
     * @param {type} 
     * @return: 节点id数组
     */
    async getNodeIdOrderByIntentsLen() {
        let idArr = await this.getNodeIdOrder('size(n.intents)');
        return idArr;
    }

    /**
     * @description: 向父节点添加子节点
     * @param {type} parent 父节点
     * @param {type} child 子节点
     * @return: 添加的关系id
     */
    async addChild(parent, child) {
        let r = new LatticeRelationship(parent.id, child.id);
        await this.addRelationship(r);
        return r.id
    }

    /**
     * @description: 父节点中删除子节点
     * @param {type} parent 父节点
     * @param {type} child 子节点
     * @return: 删除的关系id
     */
    async delChild(parent, child) {
        let r = new LatticeRelationship(parent.id, child.id);
        await this.delRelationship(r);
        return r.id
    }


    /**
     * @description: 取节点的孩子节点
     * @param {type} node 待取节点
     * @return: 孩子节点数组
     */
    async getChild(node) {
        let r = new LatticeRelationship();
        let childArr = new Array();
        await this.getEndNode(node, r, childArr);
        return childArr;
    }

    /**
     * @description: 取节点的父亲节点
     * @param {type} node 待取节点
     * @return: 父亲节点数组
     */
    async getParent(node) {
        let r = new LatticeRelationship();
        let parentArr = new Array();
        await this.getStartNode(parentArr, r, node);
        return parentArr;
    }

    /**
     * @description: 设置节点inf属性，但不保存到数据库
     * @param {LatticeNodeModel} node 要修改的节点
     * @param {boolean} bool 要设置的属性值
     * @return: 
     */
    setInfNode(node, bool) {
        node.isInf = bool ? true : null;
    }

    /**
     * @description: 从数据库获取inf节点
     * @param
     * @return: 获取到的节点
     */
    async getInfNode() {
        let node = new LatticeNodeModel({ isInf: true });
        await this.getNodePropsByProp(node, 'isInf');
        return node;
    }

    /**
     * @description: 设置节点sup属性，但不保存到数据库
     * @param {LatticeNodeModel} node 要修改的节点
     * @param {boolean} bool 要设置的属性值
     * @return: 
     */
    setSupNode(node, bool) {
        node.isSup = bool ? true : null;
    }

    /**
     * @description: 从数据库获取sup节点
     * @param 
     * @return: 获取到的节点
     */
    async getSupNode() {
        let node = new LatticeNodeModel({ isSup: true });
        await this.getNodePropsByProp(node, 'isSup');
        return node;
    }

    /**
     * @description: 寻找入度为0的节点对sup节点进行更新
     * @param {type} 
     * @return: 
     */
    async updateSupNode() {
        let record = await this._helper.exec(NODE_UPDATE_SUP_STATEMENT(
            new LatticeRelationship().type
        ));
    }


    /**
     * @description: 更新数组
     * @param {type} node 要加入的节点
     * @param {type} arr 要更新的数组
     * @return: 
     */
    updateArray(node, arr) {
        let len = node.intents.size;
        // console.log('len', len);
        // console.log('1arr.length', arr.length, arr)
        // if (len >= arr.length) {
        //     for (let i = 0; i <= len - arr.length + 1; i++) {
        //         arr.push(new Set());
        //     }
        // }
        // console.log('2arr.length', len, arr.length, arr);
        if (!arr[len]) {
            arr[len] = new Set();
        }
        arr[len].add(node.id);
    }
}