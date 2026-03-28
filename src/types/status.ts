export type Status = {
	updated_at: string;
	dependencies: {
		database: {
			version: string;
			max_connections: number;
			opened_connections: number;
		};
	};
};

export type OutputStatus =
	| {
			updated_at: string;
			dependencies: {
				database: {
					max_connections: number;
					opened_connections: number;
				};
			};
	  }
	| {
			updated_at: string;
			dependencies: {
				database: {
					max_connections: number;
					opened_connections: number;
					version: string;
				};
			};
	  };
