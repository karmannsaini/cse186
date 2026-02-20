import PropTypes from 'prop-types';
import {ListItem as MuiListItem, ListItemButton, ListItemText}
  from '@mui/material';

const ListItem = ({name}) => {
  return (
    <MuiListItem disablePadding>
      <ListItemButton>
        <ListItemText primary={name} />
      </ListItemButton>
    </MuiListItem>
  );
};

ListItem.propTypes = {
  name: PropTypes.string.isRequired,
};

export default ListItem;
