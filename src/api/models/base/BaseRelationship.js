
/*
 * @Author: your name
 * @Date: 2020-02-06 22:31:38
 * @LastEditTime: 2020-06-05 22:03:04
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \express-app2\src\api\models\relationship\BaseRelationship.js
 */
export default class BaseRelationship {

    constructor(start, end, type, props = {}) {
        this._id = -1;
        this._start = start;
        this._end = end;
        this._type = type;
        this._props = props;
    }

    //getter和setter方法

    get id() {
        return this._id;
    }

    set id(id) {
        this._id = id;
    }

    get start() {
        return this._start;
    }

    set start(start) {
        this._start = start;
    }

    get end() {
        return this._end;
    }

    set end(end) {
        this._end = end;
    }

    get type() {
        return this._type;
    }

    set type(type) {
        this._type = type;
    }

    get props() {
        return this._props;
    }

    set props(props) {
        this._props = props;
    }
}