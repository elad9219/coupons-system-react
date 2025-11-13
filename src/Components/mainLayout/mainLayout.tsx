import "./mainLayout.css";
import MyHeader from './myHeader/myHeader';
import Menu from './menu/menu';
import MyFooter from "./myFooter/myFooter";
import MainPage from './mainPage/mainPage';
import MenuRouting from '../routing/MenuRouting/MenuRouting';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function MainLayout(): JSX.Element {
    const location = useLocation();

    useEffect(() => {
        localStorage.setItem('lastPath', location.pathname);
    }, [location]);

    return (
        <div className="mainLayout" dir="rtl">
            <header>
                <MyHeader/>
            </header>
            <aside>
                <Menu/>
            </aside>
            <main>
                <MenuRouting/>
            </main>
            <footer>
                <MyFooter/>
            </footer>
        </div>
    );
}

export default MainLayout;