
interface DotBageProps {
  count: number
}

export const DotBage = ({ count }: DotBageProps) => {
  console.log("count: ", count)
  return (
    <div className="flex absolute bottom-1/2 left-1/2 justify-stretch w-fit px-1.5 rounded-2xl bg-primary">
      <span className="font-bold text-txtWhite text-[12px]">
        {count > 0 ? count : null}
      </span>
    </div>
  )
}