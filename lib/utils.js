exports.sanitiseTitle = (title) => {
  let sanitised = title.replace(/\ \(.*\)$/, '');
  return sanitised;
}
