import ModeToggle from "./ModeToggle"

ModeToggle
export const Navabar=()=>{
    return(
        <div className="h-[70px] w-full shadow-xs shadow-gray-200 dark:shadow-transparent flex justify-between items-center p-4">
        <div className="flex gap-4 items-end">
        <img src="/code-forces.svg" className="h-10 w-10"/>
        <span className="copper-font font-normal text-2xl">CODE<span className="text-[#415e9c] copper-font font-normal text-2xl">FORCES</span> <span className="copper-font font-light text-sm">Analyzer</span></span>

        </div>
            <ModeToggle/>
        </div>
    )
}

