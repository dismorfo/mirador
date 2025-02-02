import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Utils } from 'manifesto.js';
import { renderWithProviders } from '../../utils/store';
import { ThumbnailCanvasGrouping } from '../../../src/components/ThumbnailCanvasGrouping';
import CanvasGroupings from '../../../src/lib/CanvasGroupings';
import manifestJson from '../../fixtures/version-2/019.json';

/** create wrapper */
function createWrapper(props) {
  return renderWithProviders(
    <ThumbnailCanvasGrouping
      index={1}
      currentCanvasId="https://purl.stanford.edu/fr426cg9537/iiif/canvas/fr426cg9537_1"
      classes={{}}
      style={{
        height: 90,
        width: 100,
      }}
      {...props}
    />,
  );
}

describe('ThumbnailCanvasGrouping', () => {
  let wrapper;
  let setCanvas;
  const data = {
    canvasGroupings: new CanvasGroupings(Utils.parseManifest(manifestJson)
      .getSequences()[0].getCanvases()).groupings(),
    height: 131,
    position: 'far-bottom',
  };
  beforeEach(() => {
    setCanvas = jest.fn();
    wrapper = createWrapper({ data, setCanvas });
  });
  it('renders', () => {
    expect(screen.getByRole('gridcell')).toBeInTheDocument();
  });
  it('sets a mirador-current-canvas-grouping class on current canvas', () => {
    expect(screen.getByRole('button')).toHaveClass('mirador-current-canvas-grouping');
  });
  it('renders a CaptionedIIIFThumbnail', () => {
    expect(screen.getByText('Image 1')).toBeInTheDocument();
  });
  it('when clicked, updates the current canvas', async () => {
    wrapper.unmount();
    const user = userEvent.setup();
    wrapper = createWrapper({ data, index: 0, setCanvas });

    await user.click(wrapper.container.querySelector('.mirador-thumbnail-nav-canvas-0')); // eslint-disable-line testing-library/no-node-access

    expect(setCanvas).toHaveBeenCalledWith('http://iiif.io/api/presentation/2.0/example/fixtures/canvas/24/c1.json');
  });
  describe('attributes based off far-bottom position', () => {
    it('in button div', () => {
      expect(screen.getByRole('button', { name: 'Image 1' })).toHaveStyle({
        height: '123px',
        width: 'auto',
      });
    });
  });
  describe('attributes based off far-right position', () => {
    beforeEach(() => {
      wrapper.unmount();
      createWrapper({
        data: {
          ...data,
          position: 'far-right',
        },
        setCanvas,
      });
    });
    it('in button div', () => {
      expect(screen.getByRole('button', { name: 'Image 1' })).toHaveStyle({
        height: 'auto',
        width: '100px',
      });
    });
  });
});
