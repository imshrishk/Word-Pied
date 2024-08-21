import WritingBox from '../components/WritingBox';

export default function Home() {
  return (
    <div>
      <h1>Real-Time Writing</h1>
      {Array.from({ length: 100 }, (_, i) => i).map(boxNumber => (
        <WritingBox key={boxNumber} boxNumber={boxNumber} />
      ))}
    </div>
  );
}