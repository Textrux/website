'use client';
import React, { createContext, useContext, useState, type PropsWithChildren } from 'react';
import { GridsModel } from '@treetsheet/parser';

interface GridsContextProps {
	gridModel: GridsModel | null;
	setGridModel: React.Dispatch<React.SetStateAction<GridsModel | null>>;
}

const GridsContext = createContext<GridsContextProps | undefined>(undefined);

export const GridsProvider = ({ children }: PropsWithChildren<any>) => {
	const [gridModel, setGridModel] = useState<GridsModel | null>(null);
	return <GridsContext.Provider value={{ gridModel, setGridModel }}>{children}</GridsContext.Provider>;
};

export const useGrid = (): GridsContextProps => {
	const context = useContext(GridsContext);
	if (!context) {
		throw new Error('useGrid must be used within a GridProvider');
	}
	return context;
};
