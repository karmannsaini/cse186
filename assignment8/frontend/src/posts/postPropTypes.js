import PropTypes from 'prop-types';

/** Shared PropTypes shape for a post. */
export const postShape = PropTypes.shape({
  id: PropTypes.number.isRequired,
  authorId: PropTypes.number.isRequired,
  authorDisplayName: PropTypes.string,
  content: PropTypes.shape({
    text: PropTypes.string.isRequired,
    createdAt: PropTypes.string.isRequired,
    visibility: PropTypes.string,
    groupId: PropTypes.string,
  }).isRequired,
});

/** Shared PropTypes for groups array (id, name). */
export const groupsPropType = PropTypes.arrayOf(PropTypes.shape({
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  name: PropTypes.string.isRequired,
}));
