// @flow
import React, { PureComponent } from 'react';
import Sound from 'react-sound';

import Button from './Button';

type Props = {
  track: Track,
};

type State = {
  playing: boolean
};


class Preview extends PureComponent {

  state: State = {
    playing: false,
  };
  props: Props;

  handlePlayingChanged = (playing: boolean) => () =>
    this.setState(state => ({ playing }));

  render() {
    const { playing } = this.state;
    const { track } = this.props;
    const { previewUrl } = track;

    const playStatus = playing
      ? Sound.status.PLAYING
      : Sound.status.STOPPED;

    return (
      <div>
        {previewUrl &&
          <div>
            <Sound
              url={previewUrl}
              playStatus={playStatus}
              onFinishedPlaying={this.handlePlayingChanged(false)}
            />
            <Button
              primary={!playing}
              danger={playing}
              onClick={this.handlePlayingChanged(!playing)}
            >
              {playing
                ? 'Stop'
                : 'Preview'
              }
            </Button>
          </div>
        }
        {!previewUrl &&
          <Button disabled>
            No Preview
          </Button>
        }
      </div>
    );
  }
}

export default Preview;