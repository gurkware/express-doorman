# Express-Doorman

This is a simple right-checking middleware.
Just define access rights and start developing.

It's able to check for rights which are to be defined as a non cyclic
network.

An simple example of rights is `SUPERADMIN -> ADMIN`.
In this case SUPERADMIN is already a ADMIN, so to checking if the user
has the right to GET route is as simple as:
```javascript
    app.get('/admin', doorman.hasRight({needed_right: 'ADMIN'}), (req, res) => {
        // protected controller function
    })
```


## Usage

Before being able to use the rights features they have to initialized at
somepoint in your app

```javascript
// server.js

const doorman = require('express-doorman')

doorman.initialize([
    ['SUPERADMIN', 'ADMIN', 'DELETE_ADMIN'],
    ['ADMIN', 'USER_INVITE', 'USER_DELETE', 'USER_EDIT', 'USER_VIEW', 'USER'],
    ['USER', 'ENTITY_VIEW']
], options)

//routes.js
const doorman = require('express-doorman')


// simple right check
const canEdit = doorman.hasRight({needed_right: 'USER_EDIT'})

app.put('/user', canEdit, controller)

// custom reject handler

const isAdmin doorman.hasRight({
    needed_right: 'ADMIN',
    on_needed_right_fail: (missingRight, req, res, next) => {
      req.flash('error', `Missing right ${missingRight}`)
      res.redirect('/')
    }
})

app.get('/admin', isAdmin, controller)

// check for id in query object

const isGroupMember = doorman.hasRight({
    entity: 'group' // req.group
    entity_id: 'members' // req.group.members
})

app.get('/group/:groupId', isGroupMember, controller)
```

## Methods

**initialize(_rights_, _options_)** - Sets up the rights network of doorman
and the default options

**hasRight(_options_)** - Checks Route on given Options, calls on_right_needed_fail if check fails, calls next() on success

### Options-Object

| Key | Definition |
|------|-----------|
|user| Field of `req` where user data is to be found _default: user_|
|user_rights | Field of `user` where rights are to be found _default: rights_|
|user_id | Field of `user` where user id is to be found _default: id_|
|entity | Field of `req` where entity data is to be found _default: null_|
|entity_id | Field of `entity` where members/owner ids are to be found _default: null_|
|entity_scope | For nesting purposes only. Eg `entity='group'`, `entity_id='ids'` and `entity_scope='members.foobar'` will result to `req.group.members.foobar.ids` for userId check _default: null_|
|on_needed_right_fail| Function which is called, when either right check failed or id check failed _default: ``(missingRight, req, res, next) => {res.status(403).send(`User is missing right ${missingRight} to do this`)}``_|




