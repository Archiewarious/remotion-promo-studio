import { Composition } from 'remotion';
import { MainComp } from './scenes/MainComp';

// Длительность подогнать под голос (замерить voice.mp3): сек * fps.
export const Root: React.FC = () => {
  return (
    <Composition
      id="Main"
      component={MainComp}
      durationInFrames={300}
      fps={30}
      width={1920}
      height={1080}
    />
  );
};
