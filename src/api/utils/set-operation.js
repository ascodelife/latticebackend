/*
 * @Author: your name
 * @Date: 2020-02-08 00:23:40
 * @LastEditTime: 2020-06-08 08:59:26
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \express-app2\src\utils\set-operation.js
 */

/**
 * @description: 取两个集合的并集
 * @param {Set} setA 集合A
 * @param {Set} setB 集合B
 * @return: 返回并集
 */
const union = (setA, setB) => {
  return new Set([...setA, ...setB]);
};

/**
 * @description: 取两个集合交集
 * @param {Set} setA 集合A
 * @param {Set} setB 集合B
 * @return: 返回交集
 */
const intersect = (setA, setB) => {
  return new Set([...setA].filter((x) => setB.has(x)));
};

/**
 * @description: 取两个集合差集
 * @param {Set} setA 集合A
 * @param {Set} setB 集合B
 * @return: 返回A-B
 */
const diff = (setA, setB) => {
  return new Set([...setA].filter((x) => !setB.has(x)));
};

/**
 * @description: 判断集合A是否是集合B的子集
 * @param {set} setA 集合A
 * @param {set} setB 集合B
 * @return: 返回判断结果
 */
const isSub = (setA, setB) => {
  return setB.size == union(setA, setB).size;
};

/**
 * @description: 判断两个集合相等
 * @param {set} setA 集合A
 * @param {set} setB 集合B
 * @return:
 */
const isEql = (setA, setB) => {
  return setA.size == setB.size && isSub(setA, setB);
};

/**
 * @description: 判断两个集合是否存在交集
 * @param {type} setA 集合A
 * @param {type} setB 集合B
 * @return:
 */
const isIntersect = (setA, setB) => {
  const setC = union(setA, setB);
  return !(setC.size === setA.size + setB.size);
};

/**
 * @description: 集合转字符串
 * @param {type} set 集合
 * @return: 转换结果
 */
const set2Str = (set) => {
  return [...set].toString();
};

export { union, intersect, diff, isSub, isEql, isIntersect,set2Str };
