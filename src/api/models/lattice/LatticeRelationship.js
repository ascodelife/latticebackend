/*
 * @Author: your name
 * @Date: 2020-02-06 23:16:01
 * @LastEditTime : 2020-02-11 02:03:35
 * @LastEditors  : Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \express-app2\src\api\models\relationship\LatticeRelationship.js
 */
import BaseRelationship from '../base/BaseRelationship'
export default class LatticeRelationship extends BaseRelationship {

    constructor(start, end) {
        super(start, end, 'child');
    }
}