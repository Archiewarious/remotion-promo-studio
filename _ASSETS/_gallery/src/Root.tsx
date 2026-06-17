import React from 'react';
import {Composition, AbsoluteFill} from 'remotion';
import {Active} from './Active';
const Wrap: React.FC = () => (<AbsoluteFill style={{backgroundColor: '#101418'}}><Active /></AbsoluteFill>);
export const Root: React.FC = () => (<Composition id='Preview' component={Wrap} durationInFrames={90} fps={30} width={1920} height={1080} />);

