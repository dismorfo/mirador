import { MosaicWindowContext } from 'react-mosaic-component/lib/contextTypes';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../utils/store';
import { Window } from '../../../src/components/Window';

/** create wrapper */
function createWrapper(props, state, renderOptions) {
  return renderWithProviders(
    <Window
      windowId="xyz"
      manifestId="foo"
      classes={{}}
      t={k => k}
      {...props}
    />,
    {
      preloadedState: {
        windows: {
          xyz: {
            collectionDialogOn: false,
            companionWindowIds: [],
          },
        },
      },
    },
    { renderOptions },
  );
}

describe('Window', () => {
  it('should render outer element', () => {
    createWrapper();
    expect(screen.getByLabelText('window')).toHaveClass('mirador-window');
  });
  it('should render <WindowTopBar>', () => {
    createWrapper();
    expect(screen.getByRole('navigation', { accessibleName: 'windowNavigation' })).toBeInTheDocument();
  });
  it('should render <PrimaryWindow>', () => {
    createWrapper();
    expect(document.querySelector('.mirador-primary-window')).toBeInTheDocument(); // eslint-disable-line testing-library/no-node-access
  });
  // See ErrorContent.test.js for futher testing of this functionality
  it('renders alert box when there is an error', async () => {
    createWrapper({ manifestError: 'Invalid JSON' });
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });
  describe('when workspaceType is mosaic', () => {
    it('calls the context mosaicWindowActions connectDragSource method to make WindowTopBar draggable', () => {
      const connectDragSource = jest.fn(component => component);
      renderWithProviders(
        <MosaicWindowContext.Provider value={{ mosaicWindowActions: { connectDragSource } }}>
          <Window
            windowId="xyz"
            manifestId="foo"
            classes={{}}
            t={k => k}
            windowDraggable
            workspaceType="mosaic"
          />
        </MosaicWindowContext.Provider>,
        {
          preloadedState: {
            windows: {
              xyz: {
                collectionDialogOn: false,
                companionWindowIds: [],
              },
            },
          },
        },
      );
      expect(connectDragSource).toHaveBeenCalled();
    });
    it('does not call the context mosaicWindowActions connectDragSource when the windowDraggable is set to false', () => {
      const connectDragSource = jest.fn(component => component);
      renderWithProviders(
        <MosaicWindowContext.Provider value={{ mosaicWindowActions: { connectDragSource } }}>
          <Window
            windowId="xyz"
            manifestId="foo"
            classes={{}}
            t={k => k}
            windowDraggable={false}
            workspaceType="mosaic"
          />
        </MosaicWindowContext.Provider>,
        {
          preloadedState: {
            windows: {
              xyz: {
                collectionDialogOn: false,
                companionWindowIds: [],
              },
            },
          },
        },
      );
      expect(connectDragSource).not.toHaveBeenCalled();
    });
  });
});
