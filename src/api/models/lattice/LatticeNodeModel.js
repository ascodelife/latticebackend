/*
 * @Author: your name
 * @Date: 2020-02-06 18:14:52
 * @LastEditTime: 2020-06-08 00:12:42
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \express-app2\src\api\models\node\LatticeNodeModel.js
 */
import BaseNodeModel from "../base/BaseNodeModel";

export default class LatticeNodeModel extends BaseNodeModel {
  constructor(props = {}) {
    super(props);
    this._props.extents = new Set();
    this._props.intents = new Set();
  }

  /**
   * @description: 格节点转字符串
   * @return: 
   */
  toString() {
    return [...this._props.intents].toString();
  }

  //getter和setter方法
  set props(props) {
    this._props = props;
    this._props.extents = new Set(props.extents);
    this._props.intents = new Set(props.intents);
  }

  get props() {
    return this._props;
  }

  get extents() {
    return this._props.extents;
  }

  set extents(extents) {
    this._props.extents = extents;
  }

  get intents() {
    return this._props.intents;
  }

  set intents(intents) {
    this._props.intents = intents;
  }

  get isSup() {
    return this._props.isSup;
  }

  set isSup(isSup) {
    this._props.isSup = isSup;
  }

  get isInf() {
    return this._props.isInf;
  }

  set isInf(isInf) {
    this._props.isInf = isInf;
  }
}
