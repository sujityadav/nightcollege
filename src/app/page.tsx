
import  Homepage  from './features/home-page/page';
import  BackToTopButton  from './components/back-to-top/index';
import Footer from './components/layout/website/footer/index'

export default function Home() {
  return (
      <div className=''>
       <Homepage /> 
      <BackToTopButton/>
       <><Footer /></>
    </div>
  )
}
