/*
 * @Author: your name
 * @Date: 2020-02-03 20:11:55
 * @LastEditTime : 2020-02-14 20:07:18
 * @LastEditors  : Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \express-app\src\neo4j\Cypher.js
 */

//添加节点
export const NODE_CREATE_STATEMENT = (labels) => {
    return `CREATE (n:${labels} $props) RETURN id(n)`;
}
export const NODE_CREATE_RETURN = 'id(n)';
//更新节点
export const NODE_UPDATE_STATEMENT = 'MATCH (n) WHERE id(n)=$id SET n=$props';
//读取节点
export const NODE_RETRIEVE_BY_ID_STATEMENT = 'MATCH (n) WHERE id(n)=$id RETURN n';
export const NODE_RETRIEVE_BY_ID_RETURN = 'n';
//读取节点
export const NODE_RETRIEVE_BY_PROP_STATEMENT = (labels, propName, value) => {
    return `MATCH (n:${labels} {${propName}:${value}}) RETURN n`;
};
export const NODE_RETRIEVE_BY_PROP_RETURN = 'n';
//删除节点
export const NODE_DELETE_STATEMENT = 'MATCH (n) WHERE id(n)=$id DETACH DELETE n';
//取关系指向的节点
export const NODE_RELATIONSHIP_ENDNODE_STATEMENT = (type) => {
    return `MATCH (f)-[r:${type}]->(t) WHERE id(f)=$fid RETURN t`;
};
export const NODE_RELATIONSHIP_ENDNODE_RETURN = 't';
//取关系指向节点的起始节点
export const STARTNODE_RELATIONSHIP_NODE_STATEMENT = (type) => {
    return `MATCH (f)-[r:${type}]->(t) WHERE id(t)=$tid RETURN f`;
};
export const STARTNODE_RELATIONSHIP_NODE_RETURN = 'f';
//创建关系
export const RELATIONSHIP_CREATE_STATEMENT = (type) => {
    return `MATCH (f),(t) WHERE id(f)=$fid AND id(t)=$tid CREATE (f)-[r:${type}]->(t) RETURN id(r)`;
};
export const RELATIONSHIP_CREATE_RETURN = 'id(r)';
//删除关系
export const RELATIONSHIP_DELETE_STATEMENT = (type) => {
    return `MATCH (f)-[r:${type}]->(t) WHERE id(f)=$fid AND id(t)=$tid DELETE r RETURN id(r)`;
};
export const RELATIONSHIP_DELETE_RETURN = 'id(r)';
//节点数量
export const GRAPH_NODECOUNT_STATEMENT = (labels) => {
    return `MATCH (n:${labels}) RETURN count(n)`;
}
export const GRAPH_NODECOUNT_RETURN = 'count(n)';
//按规则排序取节点id
export const GRAPH_NODEIDARRAY_ORDER_BY_INTENTS_STATEMENT = (labels, orderStatement) => {
    return `MATCH (n:${labels}) RETURN id(n) ORDER BY ${orderStatement}`;
}
export const GRAPH_NODEIDARRAY_ORDER_BY_INTENTS_RETURN = 'id(n)';
//清空图节点
export const GRAPH_CLEAR_STATEMENT = (labels) => {
    return `MATCH (n:${labels}) DETACH DELETE n RETURN count(n)`;
};
//更新sup节点
export const NODE_UPDATE_SUP_STATEMENT = (type) => {
    return `MATCH (f)-[r:${type}]->(t{isSup:true}) SET f.isSup=true, t.isSup=NULL`;
};
//addLatticeChild
export const RELATIONSHIP_ADD_LATTICE_CHILD_STATEMENT = (labels, type) => {
    return `MATCH (f:${labels}),(t:${labels}) WHERE f.conceptId=$conceptId AND f.isFile=false AND id(t)=$tid CREATE (f)-[r:${type}]->(t)`;
};
//取树的所有路径
export const TREE_GET_PATHS_STATEMENT = (labels) => {
    return `MATCH p = (f:${labels})-[*]->(t:${labels}) where f.isRoot = true and t.isFile = true RETURN extract(x IN nodes(p) | x.value) as path`
};
export const TREE_GET_PATHS_RETURN = 'path';