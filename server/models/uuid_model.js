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

const _     = require('lodash')
const async = require('async')

function UuidModel (options) {
    const ChildModel    = options.ChildModel
    const GuardianModel = options.GuardianModel
    const AdminModel    = options.AdminModel
    const Errors        = options.Errors

    return {
        type: 'uuid',
        retrieve: (uuid, callback) => {
            const modelCallbackTemplate = (model) => {
                return (callback) => {
                    return model.retrieve(uuid, (err, result) => {
                        if (err instanceof Errors.NotFound) return callback()
                        if (err) return callback(err)

                        return callback(null, {
                            type: model.type,
                            data: result
                        })
                    })
                }
            }

            return async.parallel([
                modelCallbackTemplate(ChildModel),
                modelCallbackTemplate(GuardianModel),
                modelCallbackTemplate(AdminModel)
            ], (err, results) => {
                if (err) return callback(err)

                results = _.compact(results)

                if (_.isEmpty(results)) return callback(new Errors.NotFound())

                return callback(null, results[0])
            })
        }
    }
}

module.exports = UuidModel
