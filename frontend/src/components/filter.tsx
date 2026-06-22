import { Button } from './ui/button'
import { ListFilter } from 'lucide-react'

const Filter = () => {
    return (
        <Button type='button' variant={'outline'} className='text-[14px]   md:text-lg font-medium text-primary rounded-[8px] p-3 w-full h-[40px] md:h-[50px]'><ListFilter className=' w-6 h-6' />Filter</Button>
    )
}

export default Filter