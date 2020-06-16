/*
 * @Author: your name
 * @Date: 2020-02-04 11:19:14
 * @LastEditTime : 2020-02-08 22:14:32
 * @LastEditors  : Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \express-app\src\api\models\node.model.js
 */
export default class BaseNodeModel {

    constructor(props = {}) {
        this._id = -1;
        this._labels = new Set();
        this._props = props;
    }


    //getter和setter方法

    get id() {
        return this._id;
    }

    set id(id) {
        this._id = id;
    }

    get labels() {
        return this._labels;
    }

    set labels(labels) {
        this._labels = labels;
    }

    get props() {
        return this._props;
    }

    set props(props) {
        this._props = props;
    }

}