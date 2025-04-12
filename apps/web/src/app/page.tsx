import { addTwoNumber } from '@stream-app/sample-lib'

export default function Home() {
  const result = addTwoNumber(3, 5)
  console.log(result)

  return <div>hello world, {result}</div>
}
