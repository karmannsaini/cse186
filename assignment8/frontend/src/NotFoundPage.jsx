import {Link} from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

/**
 * Shown when the user navigates to a path that doesn't match any route.
 * @returns {object} not-found content
 */
function NotFoundPage() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        gap: 2,
        px: 2,
      }}
    >
      <Typography variant="h5" component="p">
        We can&apos;t find that page.
      </Typography>
      <Button component={Link} to="/home" variant="contained">
        Go to Home
      </Button>
    </Box>
  );
}

export default NotFoundPage;
