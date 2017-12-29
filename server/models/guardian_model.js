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

function GuardianModel (options) {
    const conn   = options.mysqlConn
    const Errors = options.Errors

    const retrieve = (uuid, callback) => {
        return async.parallel({
            guardian: (callback) => {
                return conn.query(
                    'SELECT * FROM `guardians` WHERE `uuid`=?',
                    [uuid],
                    callback
                )
            },
            child_uuids: (callback) => {
                return conn.query(
                    'SELECT `child_uuid` FROM `guardianships` WHERE `guardian_uuid`=?',
                    [uuid],
                    callback
                )
            }
        }, (err, results) => {
            if (err) return callback(err)

            if (!results.guardian || _.isEmpty(results.guardian[0])) return callback(Errors.NotFound())

            return callback(null, {
                first_name : results.guardian[0][0].first_name,
                last_name  : results.guardian[0][0].last_name,
                uuid       : results.guardian[0][0].uuid,
                image_url  : results.guardian[0][0].image_url,
                child_uuids: results.child_uuids[0]
            })
        })
    }

    return {
        type: 'guardian',
        retrieve: retrieve
    }
}

module.exports = GuardianModel
