package main

import (
	"ergo.services/ergo/act"
	"ergo.services/ergo/gen"
)

func factory_VoteWebPool() gen.ProcessBehavior {
	return &VoteWebPool{}
}

type VoteWebPool struct {
	act.Pool
}

// Init invoked on a start this process.
func (w *VoteWebPool) Init(args ...any) (act.PoolOptions, error) {
	var poolOptions act.PoolOptions
	poolOptions.WorkerFactory = factory_VoteWebWorker
	return poolOptions, nil
}
