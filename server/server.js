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

const express            = require('express')
const databaseConnection = require('./database_connection')
const Errors             = require('./errors')

const app  = express()
const port = process.env.PORT || 3000

const mysqlConn = databaseConnection({
    host    : 'localhost',
    user    : 'root',
    password: '',
    database: 'in-out'
})

const options = {
    mysqlConn: mysqlConn,
    Errors   : Errors
}

const GuardianModel = options.GuardianModel = require('./models/guardian_model')(options)
const ChildModel    = options.ChildModel    = require('./models/child_model')(options)
const AdminModel    = options.AdminModel    = require('./models/admin_model')(options)
const UuidModel     = options.UuidModel     = require('./models/uuid_model')(options)

const RootController = {
    retrieve: (req, res, next) => {
        return res.send('(╯°□°)╯︵ ┻━┻')
    }
}

const UuidController         = options.UuidController         = require('./controllers/uuid_controller')(options)
const ChildController        = options.ChildController        = require('./controllers/child_controller')(options)
const GuardianController     = options.GuardianController     = require('./controllers/guardian_controller')(options)
const GuardianshipController = options.GuardianshipController = require('./controllers/guardianship_controller')(options)
//const AdminController        = options.AdminController        = require('./controllers/admin_controller')(options)

app.get( '/',                         RootController.retrieve      )
app.get( '/uuids/:uuid',              UuidController.retrieve      )
app.put( '/uuids/:uuid',              UuidController.update        )
app.post('/children',                 ChildController.create       )
app.post('/children/:uuid',           ChildController.create       )
app.post('/guardians',                GuardianController.create    )
app.post('/guardians/:uuid',          GuardianController.create    )
app.post('/guardians/:uuid/children', GuardianshipController.create)

app.listen(port, function() {
    console.log('Listening on ' + port)
})

let isCleaningUp
const cleanupAndExit = () => {
    if (isCleaningUp) return

    isCleaningUp = true

    if (mysqlConn && mysqlConn.end) {
        mysqlConn.end()
    }

    process.exit(0)
}

process.on('SIGINT',  cleanupAndExit)
process.on('SIGTERM', cleanupAndExit)
