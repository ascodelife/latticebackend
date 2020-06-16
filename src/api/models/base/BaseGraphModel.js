/*
 * @Author: your name
 * @Date: 2020-02-07 16:45:12
 * @LastEditTime: 2020-06-06 08:53:49
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \express-app2\src\api\models\base\BaseGraphModel.js
 */
import helper from '../../../neo4j/Neo4jHelper'
import LatticeNodeModel from '../../models/lattice/LatticeNodeModel'
import BaseNodeModel from '../base/BaseNodeModel'
import {
    GRAPH_NODECOUNT_STATEMENT,
    GRAPH_NODECOUNT_RETURN,

    NODE_CREATE_STATEMENT,
    NODE_CREATE_RETURN,

    NODE_UPDATE_STATEMENT,

    NODE_RETRIEVE_BY_ID_STATEMENT,
    NODE_RETRIEVE_BY_ID_RETURN,

    NODE_RETRIEVE_BY_PROP_STATEMENT,
    NODE_RETRIEVE_BY_PROP_RETURN,

    NODE_DELETE_STATEMENT,

    NODE_RELATIONSHIP_ENDNODE_STATEMENT,
    NODE_RELATIONSHIP_ENDNODE_RETURN,

    STARTNODE_RELATIONSHIP_NODE_STATEMENT,
    STARTNODE_RELATIONSHIP_NODE_RETURN,

    RELATIONSHIP_CREATE_STATEMENT,
    RELATIONSHIP_CREATE_RETURN,

    RELATIONSHIP_DELETE_STATEMENT,
    RELATIONSHIP_DELETE_RETURN,

    GRAPH_NODEIDARRAY_ORDER_BY_INTENTS_STATEMENT,
    GRAPH_NODEIDARRAY_ORDER_BY_INTENTS_RETURN,

    GRAPH_CLEAR_STATEMENT
} from '../../../neo4j/Cypher';

export default class BaseGraphModel {

    constructor(labels = new Set(['graph'])) {
        this._labels = labels;
        this._helper = helper.getInstance();
    }

    /**
     * @description: 添加节点
     * @param node 待处理节点
     * @return
     */
    async addNode(node) {
        node.labels = this._labels;
        let record = await this._helper.exec(NODE_CREATE_STATEMENT(
            [...node.labels].join(':')
        ), {
            props: node.props
        });
        node.id = record[0].get(NODE_CREATE_RETURN).toNumber();
    }

    /**
     * @description: 更新节点
     * @param {type} 待处理节点
     * @return: 
     */
    async updateNode(node) {
        let record = await this._helper.exec(NODE_UPDATE_STATEMENT, {
            id: node.id,
            props: node.props
        });
    }

    /**
     * @description: 通过节点id获取节点属性
     * @param {LatticeNodeModel} node 待处理节点
     * @return: 
     */
    async getNodePorpsById(node) {
        let record = await this._helper.exec(NODE_RETRIEVE_BY_ID_STATEMENT, {
            id: node.id,
        });
        if (record[0]) {
            let n = record[0].get(NODE_RETRIEVE_BY_ID_RETURN);
            node.props = n.properties;
        } else {
            node.id = -1;
        }

    }

    /**
     * @description: 通过节点单个属性名获取节点全部属性
     * @param {} node 待处理节点
     * @param {} propName 已知属性名
     * @return: 
     */
    async getNodePropsByProp(node, propName) {
        node.labels = this._labels;
        let record = await this._helper.exec(NODE_RETRIEVE_BY_PROP_STATEMENT(
            [...node.labels].join(':'),
            propName,
            node[propName]
        ));
        if (record[0]) {
            let n = record[0].get(NODE_RETRIEVE_BY_PROP_RETURN);
            node.props = n.properties;
            node.id = n.identity.toNumber();
        }
    }

    /**
     * @description: 删除节点
     * @param node 待处理节点 
     * @return: 
     */
    async delNode(node) {
        let record = await this._helper.exec(NODE_DELETE_STATEMENT, {
            id: node.id,
        });
    }

    /**
     * @description: 取起始节点的有向关系指向的终止节点
     * @param {type} stratNode 起始节点
     * @param {type} relationship 有向关系
     * @param {type} endNode 终止节点数组
     * @return: 指向的节点
     */
    async getEndNode(startNode, relationship, endNodeArr) {
        let record = await this._helper.exec(NODE_RELATIONSHIP_ENDNODE_STATEMENT(
            relationship.type
        ), {
            fid: startNode.id
        });
        record.forEach((item) => {
            let endNode = new BaseNodeModel();
            //继承原型
            endNode.__proto__ = startNode.__proto__;
            let n = item.get(NODE_RELATIONSHIP_ENDNODE_RETURN);
            endNode.props = n.properties;
            endNode.id = n.identity.toNumber();
            endNodeArr.push(endNode);
        })
    }

    /**
     * @description: 取有向关系指向终止节点的起始节点
     * @param {type} startNodeArr 起始节点数组
     * @param {type} relationship 有向关系
     * @param {type} endNode 终止节点
     * @return: 指向的节点
     */
    async getStartNode(startNodeArr, relationship, endNode) {
        let record = await this._helper.exec(STARTNODE_RELATIONSHIP_NODE_STATEMENT(
            relationship.type
        ), {
            tid: endNode.id
        });
        record.forEach((item) => {
            let startNode = new BaseNodeModel();
            //继承原型
            startNode.__proto__ = endNode.__proto__;
            let n = item.get(STARTNODE_RELATIONSHIP_NODE_RETURN);
            startNode.props = n.properties;
            startNode.id = n.identity.toNumber();
            startNodeArr.push(startNode);
        })
    }

    /**
     * @description: 创建一个有向关系
     * @param {type} 要创建的关系
     * @return: 
     */
    async addRelationship(relationship) {
        let record = await this._helper.exec(RELATIONSHIP_CREATE_STATEMENT(
            relationship.type
        ), {
            fid: relationship.start,
            tid: relationship.end,
            type: relationship.type,
        });
        if (record[0]) {
            relationship.id = record[0].get(RELATIONSHIP_CREATE_RETURN).toNumber();
        }

    }

    /**
     * @description: 根据起始点和结束点删除一个有向关系
     * @param {type} 要删除的关系
     * @return: 
     */
    async delRelationship(relationship) {
        let record = await this._helper.exec(RELATIONSHIP_DELETE_STATEMENT(
            relationship.type
        ), {
            fid: relationship.start,
            tid: relationship.end,
            type: relationship.type,
        });
        if (record[0]) {
            relationship.id = record[0].get(RELATIONSHIP_DELETE_RETURN).toNumber();
        }

    }

    /**
     * @description: 按序生成节点id
     * @param {string} orderStatement 排序语句 
     * @return: 节点id数组
     */
    async getNodeIdOrder(orderStatement) {
        let record = await this._helper.exec(GRAPH_NODEIDARRAY_ORDER_BY_INTENTS_STATEMENT(
            Array.from(this._labels).join(':'),
            orderStatement));
        let idArr = [];
        record.forEach((r) => {
            let id = r.get(GRAPH_NODEIDARRAY_ORDER_BY_INTENTS_RETURN).toNumber();
            idArr.push(id);
        });
        return idArr;
    }

    /**
     * @description: 取图的节点数
     * @param {type} 
     * @return: 节点数量
     */
    async getNodeCount() {
        let record = await this._helper.exec(GRAPH_NODECOUNT_STATEMENT(
            Array.from(this._labels).join(':')));
        let count = record[0].get(GRAPH_NODECOUNT_RETURN).toNumber();
        return count;
    }

    /**
     * @description: 清空图节点
     * @param {} 
     * @return: 
     */
    async clear() {
        let record = await this._helper.exec(GRAPH_CLEAR_STATEMENT(
            [...this._labels].join(':')
        ));
    }

    //getter和setter方法
    get labels() {
        return this._labels;
    }

    set labels(labels) {
        this._labels = labels;
    }


}