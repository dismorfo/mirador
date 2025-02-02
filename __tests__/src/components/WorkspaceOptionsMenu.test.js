import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WorkspaceOptionsMenu } from '../../../src/components/WorkspaceOptionsMenu';
import { renderWithProviders } from '../../utils/store';

/** create wrapper */
function Subject({ ...props }) {
  return (
    <div>
      <WorkspaceOptionsMenu
        handleClose={() => {}}
        t={k => k}
        {...props}
      />
      ,
      ,
    </div>
  );
}

/** create anchor element */
function createAnchor() {
  return render(
    <button type="button" data-testid="menu-trigger-button">Button</button>,
  );
}

describe('WorkspaceOptionsMenu', () => {
  let user;
  beforeEach(() => {
    createAnchor();
    user = userEvent.setup();
  });

  it('renders all needed elements when open', () => {
    renderWithProviders(<Subject anchorEl={screen.getByTestId('menu-trigger-button')} open />);

    expect(screen.getByRole('menu')).toBeInTheDocument();

    const menuItems = screen.getAllByRole('menuitem');
    expect(menuItems).toHaveLength(2);
    expect(menuItems[0]).toHaveTextContent('downloadExportWorkspace');
    expect(menuItems[1]).toHaveTextContent('importWorkspace');
  });

  it('does not display unless open', () => {
    renderWithProviders(<Subject open={false} />);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('renders the export dialog when export option is clicked', async () => {
    renderWithProviders(<Subject anchorEl={screen.getByTestId('menu-trigger-button')} open />);
    expect(document.querySelector('#workspace-export')).not.toBeInTheDocument(); // eslint-disable-line testing-library/no-node-access

    await user.click(screen.getAllByRole('menuitem')[0]);
    expect(document.querySelector('#workspace-export')).toBeInTheDocument(); // eslint-disable-line testing-library/no-node-access
  });

  it('renders the import dialog when imporrt option is clicked', async () => {
    renderWithProviders(<Subject anchorEl={screen.getByTestId('menu-trigger-button')} open />);
    expect(document.querySelector('#workspace-import')).not.toBeInTheDocument(); // eslint-disable-line testing-library/no-node-access

    await user.click(screen.getAllByRole('menuitem')[1]);
    expect(document.querySelector('#workspace-import')).toBeInTheDocument(); // eslint-disable-line testing-library/no-node-access
  });

  it('fires the correct callbacks on menu close', async () => {
    const handleClose = jest.fn();
    renderWithProviders(<Subject anchorEl={screen.getByTestId('menu-trigger-button')} handleClose={handleClose} open />);

    // click a menu item should close the menu
    const menuItems = screen.getAllByRole('menuitem');
    await user.click(menuItems[0]);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
