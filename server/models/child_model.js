/*
 * MIT License
 * 
 * Copyright (c) 2017 Joseph Hui
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
'use strict'

const _      = require('lodash')
const async  = require('async')

function ChildModel (options) {
    const conn   = options.mysqlConn
    const Errors = options.Errors

    const retrieve = (uuid, callback) => {
        return async.parallel({
            child: (callback) => {
                return conn.query(
                    'SELECT * FROM `children` WHERE `uuid`=?',
                    [uuid],
                    callback
                )
            },
            guardian_uuids: (callback) => {
                return conn.query(
                    'SELECT `guardian_uuid` FROM `guardianships` WHERE `child_uuid`=?',
                    [uuid],
                    callback
                )
            }
        }, (err, results) => {
            if (err) return callback(err)

            if (!results.child || _.isEmpty(results.child[0])) return callback(new Errors.NotFound())

            return callback(null, {
                first_name    : results.child[0][0].first_name,
                last_name     : results.child[0][0].last_name,
                uuid          : results.child[0][0].uuid,
                image_url     : results.child[0][0].image_url,
                guardian_uuids: results.guardian_uuids[0]
            })
        })
    }

    return {
        type: 'child',
        retrieve: retrieve
    }
}

module.exports = ChildModel
