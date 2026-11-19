// Owner workspace whitelist implementation
// Private immutable set of trusted brand IDs.
const OWNER_BRAND_IDS = new Set(['danger-labs']);

/**
 * Determines whether the given brand object represents an owner workspace.
 *
 * @param {{id?: string, purpose?: {githubUser?: string}}} brand - Brand descriptor.
 * @returns {boolean} True if the brand is whitelisted and has a valid githubUser.
 */
export function isOwnerWorkspace(brand) {
  if (!brand || typeof brand.id !== 'string') return false;
  // Ensure the ID is in the whitelist and a githubUser string is present.
  return OWNER_BRAND_IDS.has(brand.id) && Boolean(brand.purpose?.githubUser);
}
