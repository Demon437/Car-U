import { Pagination, Stack } from "@mui/material";

interface CustomPaginationProps {
    totalPage:number;
    currentPage:number;
    onPageChnage:(page:number) => void;
}
const CustomPagination = ({totalPage, currentPage, onPageChnage}:CustomPaginationProps)=>{
    if (totalPage <= 1) return null;
    return (
        <div className="mt-12 mb-8 flex justify-center">
            <Stack spacing={2}>
                <Pagination
                    count={totalPage}
                    page={currentPage}
                    onChange={(_, value)=> onPageChnage(value)}
                    variant="outlined"
                    shape="rounded"
                    color="primary"
                    size="large"
                    sx={{
                        '& .MuiPaginationItem-root':{
                            color:'#666',
                            borderColor:'#ddd'
                        },
                        '& .Mui-selected':{
                            backgroundColor:'oklch(98.4% 0.003 247.858) !important', 
                            borderColor:'red'
                        },
                        '& .MuiPaginationItem-root:hover':{
                            backgroundColor: 'rgb(255,0,0,0.1)'
                        }
                    }}
                />
            </Stack>
        </div>
    )
}

export default CustomPagination;