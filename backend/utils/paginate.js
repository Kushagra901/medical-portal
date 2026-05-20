const paginate = async (Model, query = {}, req, populateOptions = null) => {
  const page  = parseInt(req.query.page)  || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip  = (page - 1) * limit;

  let dbQuery = Model.find(query).skip(skip).limit(limit).sort({ createdAt: -1 });
  if (populateOptions) dbQuery = dbQuery.populate(populateOptions);

  const [data, total] = await Promise.all([dbQuery, Model.countDocuments(query)]);
  return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
};

module.exports = paginate;
