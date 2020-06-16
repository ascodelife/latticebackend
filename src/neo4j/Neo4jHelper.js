/*
 * @Author: your name
 * @Date: 2020-02-03 16:40:56
 * @LastEditTime: 2020-06-05 22:12:38
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \express-app\src\neo4j\neo4jHelper.js
 */

import neo4j from 'neo4j-driver';
require('dotenv').config();


export default class Neo4jHelper {

    constructor() {
        // 声明一个私有的静态属性作为唯一的实例
        this._driver = neo4j.driver(process.env.NEO4J_HOST,
            neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASS)
        );
    }

    // 暴露一个公开的方法用于获取实例
    static getInstance() {
        if (!Neo4jHelper.INSTANCE) {
            Neo4jHelper.INSTANCE = new Neo4jHelper();
        }
        return Neo4jHelper.INSTANCE
    }

    /**
     * @description: 开始事务
     * @param {type} 
     * @return: 
     */
    beginTransaction() {
        this._openSession();
        this._txc = this._session.beginTransaction();
    }

    /**
     * @description: 异步提交事务
     * @param {type} 
     * @return: 
     */
    async commitTransaction() {
        if (this._txc) {
            await this._txc.commit();
        }
    }

    /**
     * @description: 异步回滚事务
     * @param {type} 
     * @return: 
     */
    async rollbackTransaction() {
        if (this._txc) {
            await this._txc.rollback();
        }
    }

    /**
     * @description: 结束事务
     * @param {type} 
     * @return: 
     */
    async endTransaction() {
        this._txc = null;
        this._closeSession();
    }

    /**
     * @description: 异步关闭驱动,只在不再需要访问数据库时调用
     * @param {type} 
     * @return: 
     */
    async closeDriver() {
        await this._driver.close();
        this._driver = null;
    }

    /**
     * @description: 执行语句
     * @param string
     * @return: 
     */
    async exec(statement, param) {
        let result;
        if (this._txc) { //如果在事务中
            result = this._txc.run(statement, param);
        } else {
            if (!this._session) {
                this._openSession();
            }
            result = await this._session.run(statement, param);
            // await this._closeSession(); 不需要频繁获取和关闭会话
        }
        return result.records;
    }


    _openSession() {
        //只能同时保持一个会话
        if (this._session) {
            return
        }
        this._session = this._driver.session();
    }

    async _closeSession() {
        if (this._session) {
            await this._session.close();
            this._session = null;
        }
    }
}