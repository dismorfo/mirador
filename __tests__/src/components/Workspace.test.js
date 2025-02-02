import { screen, fireEvent, waitFor } from '@testing-library/react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { renderWithProviders } from '../../utils/store';
import { Workspace } from '../../../src/components/Workspace';

/**
 * Utility function to create a Worksapce
 * component with all required props set
*/
function createWrapper(props) {
  return renderWithProviders(
    <DndProvider backend={HTML5Backend}>
      <Workspace
        classes={{}}
        isWorkspaceControlPanelVisible
        windowIds={['1', '2']}
        workspaceId="foo"
        workspaceType="mosaic"
        t={k => k}
        {...props}
      />
    </DndProvider>,
    {
      preloadedState: {
        windows: { 1: {}, 2: {} },
        workspace: {
          viewportPosition: {
            height: 10, width: 10, x: 0, y: 0,
          },
        },
      },
    },
  );
}

/* eslint-disable testing-library/no-container, testing-library/no-node-access */
describe('Workspace', () => {
  describe('if workspace type is elastic', () => {
    it('should render <WorkspaceElastic/> properly', () => {
      const { container } = createWrapper({ workspaceType: 'elastic' });

      expect(screen.getByRole('heading', { name: 'miradorViewer' })).toBeInTheDocument();

      expect(container.querySelector('.mirador-workspace.react-draggable')).toBeInTheDocument();
    });
  });
  describe('if workspace type is mosaic', () => {
    it('should render <WorkspaceMosaic/> properly', () => {
      const { container } = createWrapper();

      expect(screen.getByRole('heading', { name: 'miradorViewer' })).toBeInTheDocument();

      expect(container.querySelector('.mirador-mosaic')).toBeInTheDocument();
      expect(container.querySelector('.drop-target-container')).toBeInTheDocument();
    });
  });
  describe('if workspace type is unknown', () => {
    it('should render <Window/> components as list', () => {
      createWrapper({ workspaceType: 'bubu' });

      expect(screen.getByRole('heading', { name: 'miradorViewer' })).toBeInTheDocument();
      expect(screen.getAllByLabelText('window')).toHaveLength(2);
    });
  });
  describe('if any windows are maximized', () => {
    it('should render only maximized <Window/> components', () => {
      createWrapper({ maximizedWindowIds: ['1'] });

      expect(screen.getByRole('heading', { name: 'miradorViewer' })).toBeInTheDocument();
      expect(screen.getByLabelText('window')).toHaveAttribute('id', '1');
    });
  });

  describe('if there are no windows', () => {
    it('should render placeholder content', () => {
      createWrapper({ windowIds: [] });

      expect(screen.getByRole('heading', { name: 'miradorViewer' })).toBeInTheDocument();
      expect(screen.getByText('welcome')).toHaveClass('MuiTypography-h1');
    });
  });

  describe('when the workspace control panel is displayed', () => {
    it('has the *-with-control-panel class applied', () => {
      const { container } = createWrapper();

      expect(container.querySelector('.mirador-workspace-with-control-panel')).toBeInTheDocument();
    });
  });

  describe('when the workspace control panel is not displayed', () => {
    it('does not have the *-with-control-panel class applied', () => {
      const { container } = createWrapper({ isWorkspaceControlPanelVisible: false });

      expect(container.querySelector('.mirador-workspace-with-control-panel')).not.toBeInTheDocument();
    });
  });

  describe('drag and drop', () => {
    it('adds a new catalog entry from a manifest', async () => {
      const manifestJson = '{ "data": "123" }';

      const addWindow = jest.fn();

      const { container } = createWrapper({ addWindow });
      const dropTarget = container.querySelector('.mirador-workspace-with-control-panel');

      const file = new File([manifestJson], 'manifest.json', { type: 'application/json' });
      const dataTransfer = {
        files: [file],
        types: ['Files'],
      };

      fireEvent.dragStart(dropTarget, { dataTransfer });
      fireEvent.dragEnter(dropTarget, { dataTransfer });
      fireEvent.dragOver(dropTarget, { dataTransfer });
      fireEvent.drop(dropTarget, { dataTransfer });

      await waitFor(() => expect(addWindow).toHaveBeenCalledWith({ manifest: manifestJson, manifestId: expect.stringMatching(/^[0-9a-f-]+$/) }));
    });

    it('adds a new catalog entry from a IIIF drag and drop icon', () => {
      const manifestJson = '{ "data": "123" }';

      const addWindow = jest.fn();

      const { container } = createWrapper({ addWindow, allowNewWindows: false });

      const dropTarget = container.querySelector('.mirador-workspace-with-control-panel');

      const file = new File([manifestJson], 'manifest.json', { type: 'application/json' });
      const dataTransfer = {
        files: [file],
        types: ['Files'],
      };

      fireEvent.dragStart(dropTarget, { dataTransfer });
      fireEvent.dragEnter(dropTarget, { dataTransfer });
      fireEvent.dragOver(dropTarget, { dataTransfer });
      fireEvent.drop(dropTarget, { dataTransfer });

      expect(addWindow).not.toHaveBeenCalled();
    });
  });
});
