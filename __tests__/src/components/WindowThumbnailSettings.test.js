import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WindowThumbnailSettings } from '../../../src/components/WindowThumbnailSettings';

/** create wrapper */
function createWrapper(props) {
  return render(
    <WindowThumbnailSettings
      classes={{}}
      direction="ltr"
      windowId="xyz"
      setWindowThumbnailPosition={() => {}}
      thumbnailNavigationPosition="off"
      {...props}
    />,
  );
}

describe('WindowThumbnailSettings', () => {
  it('renders all elements correctly', () => {
    createWrapper();
    expect(screen.getByRole('presentation', { selector: 'li' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /off/ })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /bottom/ })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /right/ })).toBeInTheDocument();
  });
  it('for far-bottom it should set the correct label active (by setting the secondary color)', () => {
    createWrapper({ thumbnailNavigationPosition: 'far-bottom' });
    expect(screen.getByRole('menuitem', { name: /bottom/ }).querySelector('svg')).toHaveClass('MuiSvgIcon-colorSecondary'); // eslint-disable-line testing-library/no-node-access
    expect(screen.getByRole('menuitem', { name: /right/ }).querySelector('svg')).not.toHaveClass('MuiSvgIcon-colorSecondary'); // eslint-disable-line testing-library/no-node-access
    expect(screen.getByRole('menuitem', { name: /off/ }).querySelector('svg')).not.toHaveClass('MuiSvgIcon-colorSecondary'); // eslint-disable-line testing-library/no-node-access
  });
  it('for far-right it should set the correct label active (by setting the secondary color)', () => {
    createWrapper({ thumbnailNavigationPosition: 'far-right' });
    expect(screen.getByRole('menuitem', { name: /right/ }).querySelector('svg')).toHaveClass('MuiSvgIcon-colorSecondary'); // eslint-disable-line testing-library/no-node-access
    expect(screen.getByRole('menuitem', { name: /off/ }).querySelector('svg')).not.toHaveClass('MuiSvgIcon-colorSecondary'); // eslint-disable-line testing-library/no-node-access
    expect(screen.getByRole('menuitem', { name: /bottom/ }).querySelector('svg')).not.toHaveClass('MuiSvgIcon-colorSecondary'); // eslint-disable-line testing-library/no-node-access
  });

  it('updates state when the thumbnail config selection changes', async () => {
    const setWindowThumbnailPosition = jest.fn();
    const user = userEvent.setup();
    createWrapper({ setWindowThumbnailPosition });
    const menuItems = screen.queryAllByRole('menuitem');
    expect(menuItems.length).toBe(3);
    expect(menuItems[0]).toBeInTheDocument();
    expect(menuItems[1]).toBeInTheDocument();
    expect(menuItems[2]).toBeInTheDocument();

    await user.click(menuItems[0]);
    expect(setWindowThumbnailPosition).toHaveBeenCalledWith('xyz', 'off');
    await user.click(menuItems[1]);
    expect(setWindowThumbnailPosition).toHaveBeenCalledWith('xyz', 'far-bottom');
    await user.click(menuItems[2]);
    expect(setWindowThumbnailPosition).toHaveBeenCalledWith('xyz', 'far-right');
  });

  it('when rtl flips an icon', () => {
    createWrapper({ direction: 'rtl' });
    expect(screen.getByRole('menuitem', { name: /right/ }).querySelector('svg')).toHaveStyle('transform: rotate(180deg);'); // eslint-disable-line testing-library/no-node-access
  });
});
