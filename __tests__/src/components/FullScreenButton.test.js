import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FullScreenContext from '../../../src/contexts/FullScreenContext';
import { FullScreenButton } from '../../../src/components/FullScreenButton';

/** */
function createWrapper(props, contextProps = { active: false }) {
  return render(
    <FullScreenContext.Provider value={{ enter: () => { }, exit: () => { }, ...contextProps }}>
      <FullScreenButton
        classes={{}}
        className="xyz"
        {...props}
      />
    </FullScreenContext.Provider>,
  );
}

describe('FullScreenButton', () => {
  it('renders without an error', () => {
    createWrapper();

    expect(screen.getByRole('button')).toHaveClass('xyz');
  });

  describe('when not in fullscreen', () => {
    let enter;
    let user;
    beforeEach(() => {
      enter = jest.fn();
      user = userEvent.setup();
      createWrapper({}, { enter });
    });

    it('has the proper aria-label i18n key', () => {
      expect(screen.getByRole('button')).toHaveAccessibleName('workspaceFullScreen');
    });

    it('triggers the handle enter with the appropriate boolean', async () => {
      await user.click(screen.getByRole('button'));

      expect(enter).toHaveBeenCalled();
    });
  });

  describe('when in fullscreen', () => {
    let exit;
    let user;
    beforeEach(() => {
      exit = jest.fn();
      user = userEvent.setup();
      createWrapper({}, { active: true, exit });
    });

    it('has the proper aria-label', () => {
      expect(screen.getByRole('button')).toHaveAccessibleName('exitFullScreen');
    });

    it('triggers the handle exit with the appropriate boolean', async () => {
      await user.click(screen.getByRole('button'));

      expect(exit).toHaveBeenCalled();
    });
  });
});
