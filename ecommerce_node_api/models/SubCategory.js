const mongoose = require('mongoose');
const slugify = require('../utils/slugify');


const subCategorySchema = new mongoose.Schema(
{
name: { type: String, required: true, trim: true },
image: { type: String, default: '' },
category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
slug: { type: String, index: true }
},
{ timestamps: true }
);


subCategorySchema.index({ category: 1, name: 1 }, { unique: true });


subCategorySchema.pre('save', function (next) {
if (this.isModified('name')) this.slug = slugify(this.name);
next();
});


module.exports = mongoose.model('SubCategory', subCategorySchema);