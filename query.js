function getParameters(url) {
  const urlObject = new URL(url);

  const serachParams = new URLSearchParams(urlObject.search);

  const params = {};

  for (const [key, value] of serachParams) {
    params[key] = value;
  }

  return params;
}

function clearParameter(url, param) {
  const urlObject = new URL(url);

  const params = new URLSearchParams(urlObject.search);

  params.delete(param);

  urlObject.search = params.toString();

  return urlObject.toString();
}

module.exports = { getParameters, clearParameter };
