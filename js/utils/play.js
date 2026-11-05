const { apiBotTypes } = require('./converter');

/**
 * Works out the bot type to send when playing a script.
 *
 * A script played by ID always plays with its own type, so --type is optional there. A local file
 * has no type of its own, so it plays as a protocol script unless --type says otherwise.
 *
 * Returns { type } on success or { error } if --type isn't a known bot type.
 */
function resolvePlayType ({ file, type }) {
  const requested = typeof type === 'string' ? type.trim().toLowerCase() : null;

  if (requested && !apiBotTypes[requested]) {
    return { error: 'Please specify a --type of protocol or browser.' };
  } else if (file) {
    return { type: requested || 'protocol' };
  } else {
    return { type: requested || null };
  }
}

module.exports = { resolvePlayType };
