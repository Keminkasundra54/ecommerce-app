const mongoose = require('mongoose');
const slugify = require('../utils/slugify');


const categorySchema = new mongoose.Schema(
{
name: { type: String, required: true, unique: true, trim: true },
image: { type: String, default: '' },
slug: { type: String, unique: true, index: true }
},
{ timestamps: true }
);


categorySchema.pre('save', function (next) {
if (this.isModified('name')) this.slug = slugify(this.name);
next();
});


module.exports = mongoose.model('Category', categorySchema);